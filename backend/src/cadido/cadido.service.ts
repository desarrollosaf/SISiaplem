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
    console.log('antes');

     const sub = await this.sequelize.query(
      `SELECT id, codigo, subfondo FROM subfondo`,
      { 
        type: QueryTypes.SELECT,
     },
    );
 
    
    console.log('despues');
     return sub;

   }
}
