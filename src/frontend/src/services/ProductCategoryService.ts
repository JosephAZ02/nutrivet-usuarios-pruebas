import type ProductCategory from "../interfaces/ProductCategory"
const URL = "http://localhost:8083/api/productCategory";



export async function LoadProductCategories() {
    const response = await fetch(URL + "/all");
    const data: ProductCategory[] = await response.json();
    return data;
}

export async function CreateProductCategory(name: string) {
    const response = await fetch(URL + "/add", {
        method: "POST",
        body: new URLSearchParams({ name })
    });
    return response.ok;
}

export async function DeleteProductCategory(productCategoryId: number) {

    const response = await fetch(URL + "/delete" + "/" + productCategoryId, {
        method: "DELETE"
    });

    return response.ok;
}

export async function getProductCategoryById(productCategoryId: number) {

    const response = await fetch(
        URL + "/get/" + productCategoryId
    );
    const data: ProductCategory = await response.json();
    return data;
}

export async function UpdateProductCategory(productCategoryId: number, name: string) {

    const response = await fetch(URL + "/update" + "/" + productCategoryId, {
        method: "PUT",
        body: new URLSearchParams({ name })
    });
    return response.ok;
}

