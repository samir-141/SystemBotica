interface BoxInfoProps {
    Sing: React.ReactNode;
    value: string;
    text: string;
}
export default function BoxInfo({ Sing, value, text }: BoxInfoProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{text}</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{value}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                    {Sing}
                </div>
            </div>
        </div>
    )
}