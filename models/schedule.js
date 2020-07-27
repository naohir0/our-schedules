'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Schedule = loader.database.define('Schedule',{
  scheduleId:{
    type:Sequelize.UUID,
    primaryKey:true,
    allowNull:false
  },
  scheduleName:{
    type:Sequelize.STRING,
    allowNull:false
  },
  memo:{
    type:Sequelize.TEXT,
  },
  createdBy:{
    type:Sequelize.INTEGER,
    allowNull:false
  },
  updateAt:{
    type:Sequelize.DATE,
    allowNull:false
  }
},{
  freezeTableName:true,
  timestamps:false
});

module.exports = Schedule