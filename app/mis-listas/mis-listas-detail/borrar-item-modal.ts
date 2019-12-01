import { ShownModallyData, Page, Observable } from "tns-core-modules/ui/page/page";
import { MiListaItem } from "~/interfaces/mi-lista.interface";

type DeleteItemCloseCallback = (item: MiListaItem, willDelete: boolean) => void;

class BorrarItemViewModel extends Observable {

  readonly item: MiListaItem;
  readonly closeCallback: DeleteItemCloseCallback;
  constructor(item: MiListaItem, closeCallback: DeleteItemCloseCallback) {
    super();
    this.item = item;
    this.closeCallback = closeCallback;
  }

  deleteItem() {
    this.closeCallback(this.item, true);
  }

  cancel() {
    this.closeCallback(this.item, false);
  }

}

export function onShownModally(args: ShownModallyData) {
  const page = args.object as Page;
  const vm = new BorrarItemViewModel(args.context, args.closeCallback as DeleteItemCloseCallback);
  page.bindingContext = vm;
}
