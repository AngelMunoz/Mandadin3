import { View } from "tns-core-modules/ui/core/view";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { ListViewEventData } from "nativescript-ui-listview";
import { MisListasViewModel } from "./mis-listas-view-model";
import miListaService from "~/services/mi-lista.service";
import { MiLista } from "~/interfaces/mi-lista.interface";
import { MisListasDetailViewModel } from "./mis-listas-detail/mis-listas-detail-view-model";
import miListaItemService from "~/services/mi-lista-item.service";
import appViewModel from "~/app-view-model";

const vm = new MisListasViewModel(miListaService, miListaItemService, appViewModel);
export function onNavigatingTo(args: NavigatedData) {
  const page = args.object as Page;
  if (args.isBackNavigation) {
    vm.refrescarListas();
  }
  page.bindingContext = vm;
}

export function onSelected(args: ListViewEventData) {
  const view = args.view as View;
  const page = view.page as Page;
  const tappedItem = view.bindingContext as MiLista;
  page.frame.navigate({
    moduleName: "mis-listas/mis-listas-detail/mis-listas-detail-page",
    bindingContext: new MisListasDetailViewModel(
      page.frame,
      miListaService,
      miListaItemService,
      tappedItem
    ),
    animated: true,
    transition: {
      name: "slide",
      duration: 200,
      curve: "ease"
    }
  });
}
