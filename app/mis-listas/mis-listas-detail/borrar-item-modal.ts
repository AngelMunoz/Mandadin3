import { ShownModallyData, Page, Observable } from "tns-core-modules/ui/page/page";
import { IMiListaItem } from "~/interfaces/mi-lista.interface";

type DeleteItemCloseCallback = (item: IMiListaItem, willDelete: boolean) => void;

class BorrarItemViewModel extends Observable {

  readonly item: IMiListaItem;
  readonly closeCallback: DeleteItemCloseCallback;
  constructor(item: IMiListaItem, closeCallback: DeleteItemCloseCallback) {
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
