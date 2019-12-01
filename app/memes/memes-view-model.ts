import { Observable, EventData } from "tns-core-modules/data/observable";
import { AppViewModel } from "~/app-view-model";
import { ImageSource } from "tns-core-modules/image-source/image-source";

export class MemesViewModel extends Observable {

  private _shared: ImageSource;

  constructor(private readonly $app: AppViewModel) {
    super();
  }

  get shared() {
    return this._shared;
  }

  set shared(src: ImageSource) {
    this._shared = src;
    this.notifyPropertyChange("shared", this._shared);
  }

  onNavigatedTo(args: EventData) {
    if (this.$app.imageSrc) {
      this.shared = this.$app.imageSrc;
    }
  }
}
