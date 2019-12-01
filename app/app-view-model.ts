import * as app from "tns-core-modules/application";
import { Observable } from "tns-core-modules/ui/page/page";
import { ImageSource } from "tns-core-modules/image-source/image-source";
import { MainViews } from "./enums/views.enum";

export class AppViewModel extends Observable {

  private _text = "";
  private _imageSrc: ImageSource;

  private _selectedView = 0;

  constructor() {
    super();
    if (app.android) {
      app.android.on(app.AndroidApplication.activityResumedEvent, this.onResume.bind(this));
    }
  }

  get text() {
    return this._text;
  }

  set text(text: string) {
    this._text = text;
    this.notifyPropertyChange("text", this._text);
  }

  get selectedView() {
    return this._selectedView;
  }

  set selectedView(selectedView: number) {
    this._selectedView = selectedView;
    this.notifyPropertyChange("selectedView", this._selectedView);
  }

  get imageSrc() {
    return this._imageSrc;
  }

  set imageSrc(src: ImageSource) {
    this._imageSrc = src;
    this.notifyPropertyChange("imageSrc", this._imageSrc);
  }

  onResume(args: app.AndroidActivityEventData) {
    const activity = args.activity as android.app.Activity;

    const intent = activity.getIntent();
    const action = intent.getAction();
    const type = intent.getType();
    if (action === android.content.Intent.ACTION_MAIN) { return; }
    if (action === android.content.Intent.ACTION_SEND) {
      if (type.startsWith("text/")) {
        this.setText(intent);
      } else if (type.startsWith("image/")) {
        this.setImage(intent);
      }
    }
  }

  protected setText(intent: android.content.Intent) {
    const text = intent.getStringExtra(android.content.Intent.EXTRA_TEXT);
    this.text = text;
    this.selectedView = MainViews.MisListas;
    intent.removeExtra(android.content.Intent.EXTRA_TEXT);
  }

  protected setImage(intent: android.content.Intent) {
    try {
      const stream = intent.getParcelableExtra(android.content.Intent.EXTRA_STREAM) as android.net.Uri;
      const appContext = app.android.context;
      const bitmap = android.provider.MediaStore.Images.Media.getBitmap(appContext.getContentResolver(), stream);
      const src = new ImageSource(bitmap);
      this.imageSrc = src;
      this.selectedView = MainViews.Memes;
    } catch (error) { console.error(error); }
    intent.removeExtra(android.content.Intent.EXTRA_STREAM);
  }
}

export default new AppViewModel();
