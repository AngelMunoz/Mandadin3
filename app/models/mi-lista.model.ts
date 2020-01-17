import { BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, Entity } from "typeorm/browser";
import { IMiLista } from "~/interfaces/mi-lista.interface";
import { MiListaItem } from "./mi-lista-item.model";

@Entity("mis_listas")
export class MiLista extends BaseEntity implements IMiLista {

  static exists(title: string) {
    return this.count({ where: { title } })
      .then(result => result > 0);
  }

  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  hideDone: boolean;

  @OneToMany(type => MiListaItem, item => item.lista, { onDelete: "CASCADE" })
  items: Array<MiListaItem>;

  constructor(milista?: Partial<IMiLista>) {
    super();
    if (milista) { Object.assign(this, milista); }
  }

}
