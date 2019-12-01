import { ShownModallyData, Page, Observable } from "tns-core-modules/ui/page/page";
import { getText } from "nativescript-clipboard";
import appViewModel, { AppViewModel } from "~/app-view-model";

type ImportListClosedCallback = (titulo?: string, contenido?: string) => void;

class BorrarListaViewModel extends Observable {

  readonly closeCallback: ImportListClosedCallback;
  private _message = "";
  private _titulo = "";
  private _contenido = "";

  constructor(private readonly $app: AppViewModel, closeCallback: ImportListClosedCallback) {
    super();
    this.closeCallback = closeCallback;
    if (this.$app.text) {
      this.contenido = this.$app.text;
      this.message =
        'Estas migrando desde otra aplicacion.\nRevisa el contenido y selecciona "Importar" para terminar.';
    } else {
      this.message = 'Pega la lista de otras versiones de "mandadin"';
      getText().then(text => (this.contenido = text));
    }
  }

  get message() {
    return this._message;
  }

  set message(msg: string) {
    this._message = msg;
    this.notifyPropertyChange("message", this._message);
  }

  get titulo() {
    return this._titulo;
  }

  set titulo(titulo: string) {
    this._titulo = titulo;
    this.notifyPropertyChange("titulo", this._titulo);
  }

  get contenido() {
    return this._contenido;
  }

  set contenido(contenido: string) {
    this._contenido = contenido;
    this.notifyPropertyChange("contenido", this._contenido);
  }

  importar(args) {
    if (!this.titulo || !this.contenido) { return; }
    this.$app.text = "";
    this.closeCallback(this.titulo, this.contenido);
  }

  cancelar(args) {
    this.$app.text = "";
    this.closeCallback();
  }

}

export function onShownModally(args: ShownModallyData) {
  const page = args.object as Page;
  const vm = new BorrarListaViewModel(appViewModel, args.closeCallback as ImportListClosedCallback);
  page.bindingContext = vm;
}
