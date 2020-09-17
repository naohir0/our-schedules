'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Topmemo = loader.database.define('Topmemo',{
  id:{
     type:Sequelize.INTEGER,
     autoIncrement:true,
     allowNull:false,
     primaryKey:true
  },
  userId:{
    type:Sequelize.INTEGER,
    allowNull:false
  },
  username:{
    type:Sequelize.STRING,
    allowNull:false
  },
  memo:{
    type:Sequelize.TEXT
  }
 },{
  timestamps:false,
  freezeTableName:true
});

Topmemo.sync();
module.exports = Topmemo;