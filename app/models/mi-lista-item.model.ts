import { BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm/browser";
import { IMiListaItem } from "~/interfaces/mi-lista.interface";
import { MiLista } from "./mi-lista.model";

@Entity("mi_lista_items")
export class MiListaItem extends BaseEntity implements IMiListaItem {

  static exists(item: string) {
    return this.count({ where: { item } })
      .then(result => result > 0);
  }

  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  item: string;
  @Column()
  isDone: boolean;

  @ManyToOne(type => MiLista, lista => lista.items)
  lista: MiLista;

  listaId: number;

  constructor(item?: Partial<IMiListaItem>) {
    super();
    if (item) { Object.assign(this, item); }
  }

}
