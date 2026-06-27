import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface PasswordResetsAttributes {
  email: string;
  token: string;
  created_at?: Date;
}

export type PasswordResetsOptionalAttributes = "created_at";
export type PasswordResetsCreationAttributes = Optional<PasswordResetsAttributes, PasswordResetsOptionalAttributes>;

export class PasswordResets extends Model<PasswordResetsAttributes, PasswordResetsCreationAttributes> implements PasswordResetsAttributes {
  email!: string;
  token!: string;
  created_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof PasswordResets {
    return PasswordResets.init({
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'password_resets',
    timestamps: true,
    indexes: [
      {
        name: "password_resets_email_index",
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
