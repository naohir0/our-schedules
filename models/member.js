'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Member = loader.database.define('Member',{
  scheduleId:{
    type:Sequelize.UUID,
    primaryKey:true,
    allowNull:false
  },
  hostId:{
    type:Sequelize.INTEGER,
    allowNull:false
  },
  updateAt:{
    type:Sequelize.DATE,
    allowNull:false
  },
  members:{
    type:Sequelize.TEXT
  }
},{
  freezeTableName:true,
  timestamps:false
});

module.exports = Member