import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface PasswordResetTokensAttributes {
  email: string;
  token: string;
  created_at?: Date;
}

export type PasswordResetTokensPk = "email";
export type PasswordResetTokensId = PasswordResetTokens[PasswordResetTokensPk];
export type PasswordResetTokensOptionalAttributes = "created_at";
export type PasswordResetTokensCreationAttributes = Optional<PasswordResetTokensAttributes, PasswordResetTokensOptionalAttributes>;

export class PasswordResetTokens extends Model<PasswordResetTokensAttributes, PasswordResetTokensCreationAttributes> implements PasswordResetTokensAttributes {
  email!: string;
  token!: string;
  created_at?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof PasswordResetTokens {
    return PasswordResetTokens.init({
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'password_reset_tokens',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
