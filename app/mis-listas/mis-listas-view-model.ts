import { Observable, EventData } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { IMiLista } from "~/interfaces/mi-lista.interface";
import { IPaginationArgs } from "~/interfaces/pagination";
import { LoadOnDemandListViewEventData, RadListView } from "nativescript-ui-listview";
import { Button } from "tns-core-modules/ui/button/button";
import { Page, ShowModalOptions, NavigatedData } from "tns-core-modules/ui/page/page";
import { parseList, getOffset } from "~/utils";
import { AppViewModel } from "~/app-view-model";
import { MiLista, MiListaItem } from "~/models";

export class MisListasViewModel extends Observable {
  private pagination: IPaginationArgs<IMiLista> = {
    limit: 10,
    page: 1
  };
  private _titulo: string;
  private _listas: ObservableArray<IMiLista> = new ObservableArray<IMiLista>();

  constructor(private readonly $app: AppViewModel) {
    super();
    this.refrescarListas();
  }

  get titulo() {
    return this._titulo;
  }

  set titulo(titulo: string) {
    this._titulo = titulo;
    this.notifyPropertyChange("titulo", this._titulo);
  }

  get listas() {
    return this._listas;
  }

  set listas(listas: ObservableArray<IMiLista>) {
    this._listas = listas;
    this.notifyPropertyChange("listas", this._listas);
  }

  async guardarListaActual(args) {
    const exists = await MiLista.exists(this.titulo);
    if (exists) { return; }
    const pre: Partial<IMiLista> = {
      hideDone: false,
      title: this.titulo
    };
    const lista = new MiLista(pre);
    await lista.save();
    this.titulo = "";

    return this.refrescarListas();
  }

  onNavigatedTo(args: NavigatedData) {
    if (this.$app.text) {
      const page = args.object as Page;
      this.showImportList(page);
    }
  }

  onImportList(args: EventData) {
    const page = (args.object as Button).page;
    this.showImportList(page);
  }

  async onMoreDataRequested(args: LoadOnDemandListViewEventData) {
    const listView: RadListView = args.object;
    const skip = getOffset(this.pagination.page, this.pagination.limit);

    const [found, count] = await MiLista.findAndCount({ take: this.pagination.limit, skip });

    if (found.length === 0) {
      args.returnValue = false;
      listView.notifyLoadOnDemandFinished(true);

      return;
    }
    for (const lista of found) {
      if (!this.listas.some((td) => td.id === lista.id)) {
        this.listas.push(lista);
      }
    }
    this.notifyPropertyChange("listas", this.listas);
    this.pagination.page++;
    listView.notifyLoadOnDemandFinished();
    args.returnValue = true;
  }

  showImportList(page: Page) {
    const options: ShowModalOptions = {
      context: {},
      animated: true,
      fullscreen: false,
      closeCallback: this.proceedImportList.bind(this)
    };
    page.showModal("mis-listas/importar-lista-modal", options);
  }

  async proceedImportList(title: string, content: string) {
    if (!title || !content) { return; }
    const pre: Partial<IMiLista> = {
      hideDone: false,
      title
    };
    const lista = new MiLista(pre);
    lista.items = [];
    const items = parseList(content, lista.id);
    for (const preitem of items) {
      const item = new MiListaItem(preitem);
      lista.items.push(item);
    }
    await lista.save();

    return this.refrescarListas();
  }

  async refrescarListas() {
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const skip = getOffset(pagination.page, pagination.limit);
      const listas = await MiLista.find({
        take: pagination.limit,
        skip
      });
      pages.push(...listas);
    }
    this.listas = new ObservableArray<IMiLista>(pages);
  }
}
