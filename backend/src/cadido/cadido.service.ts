import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';

@Injectable()
export class CadidoService {
 constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}
    
   async getsubfondos() {
    const sub = await this.sequelize.query(
      `SELECT s.id, s.codigo, s.subfondo, d.nombre_completo FROM subfondo s INNER JOIN adminplem_saf.t_dependencia d
      ON d.id_Dependencia = s.id_dependencia`,
      { 
        type: QueryTypes.SELECT,
      },
    );
    console.log('sub ', sub);
    return sub;
   }

   async getcadido(id: number){
    console.log('id ', id);
     return [];
   }
}
