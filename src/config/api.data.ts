import data from "./Data.json";
function FindProducts() {
    const productos = data.productos;
    return productos;
}
function FindUsers() {
    const users = data.usuarios;
    return users;
}
export { FindProducts, FindUsers }