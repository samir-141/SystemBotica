interface Props {
    formData: any;
    setFormData: any;
}


export default function ProductForm({
    formData,
    setFormData
}: Props) {


    return (
        <>
            <input
                value={formData.nombre_comercial}
                onChange={
                    e => setFormData({
                        ...formData,
                        nombre_comercial: e.target.value
                    })
                }
            />


            <input
                value={formData.sku}
            />

        </>
    )

}