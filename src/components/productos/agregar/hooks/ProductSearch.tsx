interface Props {
    identificador: string;
    setIdentificador: (v: string) => void;
    onSearch: () => void;
    loading: boolean;
}


export default function ProductSearch({
    identificador,
    setIdentificador,
    onSearch,
    loading
}: Props) {


    return (
        <div>

            <input
                value={identificador}
                onChange={
                    e => setIdentificador(e.target.value)
                }
            />


            <button
                onClick={onSearch}
                disabled={loading}
            >
                {loading ? "Buscando..." : "Buscar"}
            </button>


        </div>
    )

}