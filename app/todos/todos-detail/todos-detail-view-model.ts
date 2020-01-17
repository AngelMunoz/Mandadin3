import { Observable } from "tns-core-modules/data/observable";
import { ITodo } from "~/interfaces/todo.interface";
import { Frame, EventData } from "@nativescript/core/ui/frame/frame";
import { TextBase } from "@nativescript/core/ui/text-base/text-base";
import { Todo } from "~/models";

export class TodosDetailViewModel extends Observable {
  private _todo: ITodo;
  constructor(todo: ITodo, private readonly $frame: Frame) {
    super();
    this.todo = { ...todo };
  }

  get todo() {
    return this._todo;
  }

  set todo(todo: ITodo) {
    this._todo = { ...todo };
    this.notifyPropertyChange("todo", todo);
  }

  async updateProperty(args: EventData) {
    const field = args.object as TextBase;
    const pretodo = { ...this.todo };
    const value = (args as any).value;
    switch (field.id) {
      case "title":
        const exists = await Todo.titleExists(value);
        if (exists) { return; }
        pretodo.title = value;
        break;
      case "content":
        pretodo.content = value;
        break;
    }
    const todo = await Todo.findOneOrFail(pretodo.id);
    todo.title = pretodo.title;
    todo.content = pretodo.content;

    return todo.save();
  }

  async deleteTodo() {
    try {
      await Todo.delete(this.todo.id);
    } catch (error) {
      console.error(error);
    }
    this.$frame.goBack();
  }
}
