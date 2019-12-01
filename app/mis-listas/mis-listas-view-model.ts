import { Observable, EventData } from "tns-core-modules/data/observable";
import { MiListaService } from "~/services/mi-lista.service";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { MiLista } from "~/interfaces/mi-lista.interface";
import { PaginationArgs } from "~/interfaces/pagination";
import { LoadOnDemandListViewEventData, RadListView } from "nativescript-ui-listview";
import { Button } from "tns-core-modules/ui/button/button";
import { Page, ShowModalOptions, NavigatedData } from "tns-core-modules/ui/page/page";
import { parseList } from "~/utils";
import { MiListaItemService } from "~/services/mi-lista-item.service";
import { AppViewModel } from "~/app-view-model";

export class MisListasViewModel extends Observable {
  private pagination: PaginationArgs<MiLista> = {
    limit: 10,
    page: 1,
    order: [{ property: "title", direction: "asc" }]
  };
  private _titulo: string;
  private _listas: ObservableArray<MiLista> = new ObservableArray<MiLista>();

  constructor(
    private readonly $misListas: MiListaService,
    private readonly $items: MiListaItemService,
    private readonly $app: AppViewModel
  ) {
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

  set listas(listas: ObservableArray<MiLista>) {
    this._listas = listas;
    this.notifyPropertyChange("listas", this._listas);
  }

  guardarListaActual(args) {
    if (this.$misListas.exists(this.titulo)) { return; }
    const lista: MiLista = {
      hideDone: false,
      id: `${Date.now()}`,
      title: this.titulo
    };
    this.$misListas.create(lista);
    this.titulo = "";
    this.refrescarListas();
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

  onMoreDataRequested(args: LoadOnDemandListViewEventData) {
    const listView: RadListView = args.object;
    const found = this.$misListas.find(this.pagination);
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

  proceedImportList(title: string, content: string) {
    if (!title || !content) { return; }
    const lista: MiLista = {
      id: `${Date.now()}`,
      hideDone: false,
      title
    };
    this.$misListas.create(lista);
    const items = parseList(content, lista.id);
    for (const item of items) {
      this.$items.create(item);
    }
    this.refrescarListas();
  }

  refrescarListas() {
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const listas = this.$misListas.find(pagination);
      pages.push(...listas);
    }
    this.listas = new ObservableArray<MiLista>(pages);
  }
}
