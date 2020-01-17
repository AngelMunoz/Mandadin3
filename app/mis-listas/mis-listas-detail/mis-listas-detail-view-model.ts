import { Observable, EventData } from "tns-core-modules/data/observable";
import { Button } from "tns-core-modules/ui/button";
import { IMiLista, IMiListaItem } from "~/interfaces/mi-lista.interface";
import { IPaginationArgs } from "~/interfaces/pagination";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { LoadOnDemandListViewEventData, RadListView } from "nativescript-ui-listview";
import { ShowModalOptions, Page } from "tns-core-modules/ui/page/page";
import { Frame } from "@nativescript/core/ui/frame/frame";
import { shareText } from "nativescript-social-share";
import { UndoArgs } from "~/interfaces/undo.interface";
import { MiListaItem, MiLista } from "~/models";
import { getOffset } from "~/utils";

export class MisListasDetailViewModel extends Observable {

  private pagination: IPaginationArgs<IMiListaItem> = {
    limit: 10,
    page: 1
  };

  private _items = new ObservableArray<IMiListaItem>();
  private _undoActions = new ObservableArray<UndoArgs>();

  private _item = "";
  private _hideDone: boolean;
  private _titulo = "";
  private _editMiLista = false;

  constructor(
    private readonly $frame: Frame,
    private readonly miLista: IMiLista
  ) {
    super();
    this.hideDone = miLista.hideDone;
    this.titulo = miLista.title;
    MiLista.findOneOrFail(miLista.id)
      .then(lista => {
        this.pagination.find = this.hideDone ? { lista, isDone: false } : { lista };

        return this.refrescarEntradas();
      });

  }

  get items() {
    return this._items;
  }

  set items(items: ObservableArray<IMiListaItem>) {
    this._items = items;
    this.notifyPropertyChange("items", this._items);
  }

  get undoActions() {
    return this._undoActions;
  }

  set undoActions(undoActions: ObservableArray<UndoArgs>) {
    this._undoActions = undoActions;
    this.notifyPropertyChange("undoActions", this._undoActions);
  }

  get editMiLista() {
    return this._editMiLista;
  }

  set editMiLista(editMiLista: boolean) {
    this._editMiLista = editMiLista;
    this.notifyPropertyChange("editMiLista", this._editMiLista);
  }

  get item() {
    return this._item;
  }

  set item(item: string) {
    this._item = item;
    this.notifyPropertyChange("item", this._item);
  }

  get titulo() {
    return this._titulo;
  }

  set titulo(titulo: string) {
    this._titulo = titulo;
    this.notifyPropertyChange("titulo", this._titulo);
  }

  get hideDone() {
    return this._hideDone;
  }

  set hideDone(hide: boolean) {
    this._hideDone = hide;
    this.notifyPropertyChange("hideDone", this._hideDone);
  }

  async guardarEntradaActual() {
    const exists = await MiListaItem.exists(this.item);
    if (exists) { return; }
    const item: Partial<IMiListaItem> = {
      item: this.item,
      isDone: false,
      lista: this.pagination.find.lista
    };
    try {
      await new MiListaItem(item).save();
      this.item = "";
    } catch (error) {
      console.error(error);

      return;
    }

    return this.refrescarEntradas();
  }

  onToggleEdit(args) {
    this.editMiLista = !this.editMiLista;
  }

  async onShare(args) {
    const items = await MiListaItem.find({ where: { lista: this.miLista.id } });
    const formatted = items.reduce((prev, current) => {
      return `${prev}[${current.isDone ? " x " : "    "}] ${current.item}\n`;
    }, "");
    shareText(formatted, this.miLista.title);
  }

  async onTituloChanged(args) {
    if (args.value === this.miLista.title) { return; }
    const exists = await MiListaItem.exists(args.value);
    if (exists) { return; }
    const lista = await MiLista.findOneOrFail(this.miLista.id);
    lista.title = args.value;
    await lista.save();
    this.titulo = lista.title;
  }

  async onHideDoneChanged(args) {
    this.hideDone = args.value;
    const lista = this.pagination.find.lista;
    lista.hideDone = args.value;
    await lista.save();
    this.pagination.find = this.hideDone ? { lista, isDone: false } : { lista };

    return this.refrescarEntradas();
  }

  async onIsDoneChange(args) {
    const item: IMiListaItem = args.object.bindingContext;
    if (args.value === item.isDone) { return; }
    const unmodified = { ...item };
    const existingItem = await MiListaItem.findOneOrFail(item.id);
    existingItem.isDone = args.value;
    await existingItem.save();
    const index: number = this.getIndex(item);
    if (this.hideDone && existingItem.isDone && !Number.isNaN(Number(index))) {
      this.items.splice(index, 1);
      this.notifyPropertyChange("items", this.items);
    }
    this.pushUndo({
      action: args.value ? "MarkAsDone" : "MarkAsUndone",
      prevIndex: index,
      item: unmodified
    });
  }

  async onUndo(args) {
    const [{ item, prevIndex }] = this.undoActions.splice(0, 1);
    const saved = await MiListaItem.findOneOrFail(item.id);
    saved.isDone = item.isDone;
    await saved.save();

    if (prevIndex !== null && prevIndex !== undefined && prevIndex >= 0) {
      this.items.splice(prevIndex, 0, saved);
      this.notifyPropertyChange("items", this.items);
    }
    this.notifyPropertyChange("undoActions", this._undoActions);
  }

  async onItemTextChange(args) {
    const exists = await MiListaItem.exists(args.value);
    if (exists) { return; }
    const prev: IMiListaItem = args.object.bindingContext;
    const item = await MiListaItem.findOneOrFail(prev.id);
    item.item = args.value;
    await item.save();
  }

  onDeleteItem(args: EventData) {
    const item: IMiListaItem = (args.object as Button).bindingContext;
    const page = (args.object as Button).page;

    this.confirmDelete(item, page);
  }

  onDeleteList(args: EventData) {
    const page = (args.object as Button).page;
    this.confirmDeleteList(page);
  }

  async onMoreDataRequested(args: LoadOnDemandListViewEventData) {
    const listView: RadListView = args.object;
    const lista = this.pagination.find.lista;
    const where =
      this.hideDone ? { lista, isDone: false } : { lista };
    const skip = getOffset(this.pagination.page, this.pagination.limit);
    const [found, count] = await MiListaItem.findAndCount({ take: this.pagination.limit, where, skip });
    if (found.length === 0) {
      args.returnValue = false;
      listView.notifyLoadOnDemandFinished(true);

      return;
    }
    for (const item of found) {
      if (!this.items.some((td) => td.id === item.id)) {
        this.items.push(item);
      }
    }
    this.notifyPropertyChange("items", this.items);
    this.pagination.page++;
    listView.notifyLoadOnDemandFinished();
    args.returnValue = true;
  }

  confirmDelete(item: IMiListaItem, page: Page) {
    const options: ShowModalOptions = {
      context: item,
      animated: true,
      closeCallback: this.proceedDelete.bind(this),
      fullscreen: false
    };
    page.showModal("mis-listas/mis-listas-detail/borrar-item-modal", options);
  }

  confirmDeleteList(page: Page) {
    const options: ShowModalOptions = {
      context: this.miLista,
      animated: true,
      closeCallback: this.proceedDeleteList.bind(this),
      fullscreen: false
    };
    page.showModal("mis-listas/mis-listas-detail/borrar-lista-modal", options);
  }

  async proceedDelete(item: IMiListaItem, willDelete: boolean) {
    if (!item || !willDelete) {
      return;
    }
    try {
      await MiListaItem.delete(item.id);
    } catch (error) {
      console.error(error);
    }
    const [index] = this.items.map((itm, i) => itm.id === item.id ? i : null).filter((itm) => itm >= 0);
    if (!Number.isNaN(Number(index)) && index >= 0) {
      this.items.splice(index, 1);
      this.notifyPropertyChange("items", this.items);
    }
  }

  async proceedDeleteList(willDelete: boolean) {
    if (!willDelete) {
      return;
    }
    try {
      const lista = await MiLista.findOneOrFail(this.miLista.id);
      await MiListaItem.delete({ lista });
      await MiLista.delete(this.miLista.id);
    } catch (error) {
      console.error(error);
    }
    this.$frame.goBack();
  }

  pushUndo(args: UndoArgs) {
    this.undoActions.splice(0, 1, args);
    this.notifyPropertyChange("undoActions", this.undoActions);
  }

  async refrescarEntradas() {
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const skip = getOffset(pagination.page, pagination.limit);
      const lista = pagination.find.lista;
      const where =
        this.hideDone ? { lista, isDone: false } : { lista };
      const items = await MiListaItem.find({
        take: pagination.limit,
        where,
        skip
      });
      pages.push(...items);
    }
    this.items = new ObservableArray<IMiListaItem>(pages);
    this.notifyPropertyChange("items", this.items);
  }

  private getIndex(item: IMiListaItem) {
    let index: number;
    this.items.forEach((itm, i) => {
      if (itm.id === item.id) {
        index = i;
      }
    });

    return index;
  }
}
