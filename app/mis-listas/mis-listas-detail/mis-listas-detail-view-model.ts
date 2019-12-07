import { Observable, EventData } from "tns-core-modules/data/observable";
import { Button } from "tns-core-modules/ui/button";
import { MiLista, MiListaItem } from "~/interfaces/mi-lista.interface";
import { MiListaItemService } from "~/services/mi-lista-item.service";
import { PaginationArgs } from "~/interfaces/pagination";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { LoadOnDemandListViewEventData, RadListView } from "nativescript-ui-listview";
import { MiListaService } from "~/services/mi-lista.service";
import { ShowModalOptions, Page } from "tns-core-modules/ui/page/page";
import { Frame } from "@nativescript/core/ui/frame/frame";
import { shareText } from "nativescript-social-share";
import { UndoArgs } from "~/interfaces/undo.interface";

export class MisListasDetailViewModel extends Observable {

  private pagination: PaginationArgs<MiListaItem> = {
    limit: 10,
    page: 1,
    order: [{ property: "item", direction: "asc" }]
  };

  private _items = new ObservableArray<MiListaItem>();
  private _undoActions = new ObservableArray<UndoArgs>();

  private _item = "";
  private _hideDone: boolean;
  private _titulo = "";
  private _editMiLista = false;

  constructor(
    private readonly $frame: Frame,
    private readonly $misListas: MiListaService,
    private readonly $items: MiListaItemService,
    private readonly miLista: MiLista
  ) {
    super();
    this.hideDone = miLista.hideDone;
    this.titulo = miLista.title;
    this.pagination.where = [];
    if (this.hideDone) {
      this.pagination.where.push({ property: "isDone", comparison: "equalTo", value: false });
    }
    this.pagination.where.push({ property: "lista", comparison: "equalTo", value: this.miLista.id });
    this.refrescarEntradas();
  }

  get items() {
    return this._items;
  }

  set items(items: ObservableArray<MiListaItem>) {
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

  guardarEntradaActual() {
    if (this.$items.exists(this.item)) { return; }
    const item: MiListaItem = {
      id: `${Date.now()}`,
      item: this.item,
      lista: this.miLista.id,
      isDone: false
    };
    this.$items.create(item);
    this.item = "";
    this.refrescarEntradas();
  }

  onToggleEdit(args) {
    this.editMiLista = !this.editMiLista;
  }

  onShare(args) {
    const items = this.$items.findAllInList(this.miLista.id);
    const formatted = items.reduce((prev, current) => {
      return `${prev}[${current.isDone ? " x " : "    "}] ${current.item}\n`;
    }, "");
    shareText(formatted, this.miLista.title);
  }

  onTituloChanged(args) {
    if (args.value === this.miLista.title) { return; }
    if (this.$misListas.exists(args.value)) { return; }
    const milista: MiLista = {
      ...this.miLista,
      title: args.value
    };
    this.titulo = milista.title;
    this.$misListas.update(milista);
  }

  onHideDoneChanged(args) {
    const milista: MiLista = {
      ...this.miLista,
      hideDone: args.value
    };
    this.hideDone = milista.hideDone;
    this.$misListas.update(milista);
    this.pagination.where = [];
    if (this.hideDone) {
      this.pagination.where.push({ property: "isDone", comparison: "equalTo", value: false });
    }
    this.pagination.where.push({ property: "lista", comparison: "equalTo", value: this.miLista.id });
    this.refrescarEntradas();
  }

  onIsDoneChange(args) {
    const item: MiListaItem = args.object.bindingContext;
    if (args.value === item.isDone) { return; }
    const unmodified = { ...item };
    item.isDone = args.value;
    this.$items.update(item);
    const index: number = this.getIndex(item);
    if (this.hideDone && item.isDone && !Number.isNaN(Number(index))) {
      this.items.splice(index, 1);
      this.notifyPropertyChange("items", this._items);
    }
    this.pushUndo({
      action: args.value ? "MarkAsDone" : "MarkAsUndone",
      prevIndex: index,
      item: unmodified
    });
  }

  onUndo(args) {
    const [{ item, prevIndex }] = this.undoActions.splice(0, 1);
    this.$items.update(item);
    if (prevIndex !== null && prevIndex !== undefined && prevIndex >= 0) {
      this.items.splice(prevIndex, 0, item);
      this.notifyPropertyChange("items", this._items);
    }
    this.notifyPropertyChange("undoActions", this._undoActions);
  }

  onItemTextChange(args) {
    if (this.$items.exists(args.value)) { return; }
    const item: MiListaItem = args.object.bindingContext;
    item.item = args.value;
    this.$items.update(item);
  }

  onDeleteItem(args: EventData) {
    const item: MiListaItem = (args.object as Button).bindingContext;
    const page = (args.object as Button).page;

    this.confirmDelete(item, page);
  }

  onDeleteList(args: EventData) {
    const page = (args.object as Button).page;
    this.confirmDeleteList(page);
  }

  onMoreDataRequested(args: LoadOnDemandListViewEventData) {
    const listView: RadListView = args.object;
    const found = this.$items.find(this.pagination);
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

  confirmDelete(item: MiListaItem, page: Page) {
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

  proceedDelete(item: MiListaItem, willDelete: boolean) {
    if (!item || !willDelete) {
      return;
    }
    this.$items.destroy(item.id);
    const [index] = this.items.map((itm, i) => itm.id === item.id ? i : null).filter((itm) => itm >= 0);
    if (!Number.isNaN(Number(index)) && index >= 0) {
      this.items.splice(index, 1);
    }
  }

  proceedDeleteList(willDelete: boolean) {
    if (!willDelete) {
      return;
    }
    const deleted = this.$items.destroyAll(this.miLista.id);
    if (deleted) {
      this.$misListas.destroy(this.miLista.id);
    }
    this.$frame.goBack();
  }

  pushUndo(args: UndoArgs) {
    this.undoActions.splice(0, 1, args);
    this.notifyPropertyChange("undoActions", this.undoActions);
  }

  refrescarEntradas() {
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const listas = this.$items.find(pagination);
      pages.push(...listas);
    }
    this.items = new ObservableArray<MiListaItem>(pages);
  }

  private getIndex(item: MiListaItem) {
    let index: number;
    this.items.forEach((itm, i) => {
      if (itm.id === item.id) {
        index = i;
      }
    });

    return index;
  }
}
