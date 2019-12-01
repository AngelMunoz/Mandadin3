import { ShownModallyData, Page, Observable } from "tns-core-modules/ui/page/page";
import { MiLista } from "~/interfaces/mi-lista.interface";

type DeleteListCloseCallback = (willDelete: boolean) => void;

class BorrarListaViewModel extends Observable {

  readonly lista: MiLista;
  readonly closeCallback: DeleteListCloseCallback;
  constructor(lista: MiLista, closeCallback: DeleteListCloseCallback) {
    super();
    this.lista = lista;
    this.closeCallback = closeCallback;
  }

  yes() {
    this.closeCallback(true);
  }

  cancel() {
    this.closeCallback(false);
  }

}

export function onShownModally(args: ShownModallyData) {
  const page = args.object as Page;
  const vm = new BorrarListaViewModel(args.context, args.closeCallback as DeleteListCloseCallback);
  page.bindingContext = vm;
}
