import { Sequelize } from "sequelize";

const db = new Sequelize('db_balia', 'root','',{
    host: "localhost",
    dialect: "mysql"
})

export default db;