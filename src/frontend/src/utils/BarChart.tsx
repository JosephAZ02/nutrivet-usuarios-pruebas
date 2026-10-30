

interface BarItem {
    label: string;
    value: number;
}

interface BarListProps {
    title: string;
    subtitle: string;
    data: BarItem[];
}


function BartChar({ title, subtitle, data }: BarListProps) {
    const max = Math.max(...data.map((d) => d.value), 1); // evita dividir entre 0

    return (
        <div className="container-BartChart" style={{ fontSize: "0.8rem", width: "75%", margin: "0 auto", border: "1px solid #817f7f", borderRadius: "8px", padding: "1rem", backgroundColor: "#f9f9f9" }}>
            <div className="title" style={{ textAlign: "left", marginBottom: "1rem", position: "relative" }}>
                <h2 style={{ fontSize: "20px" }}>{title}</h2>
                <h3 style={{ fontSize: "14px", fontWeight: 400, color: "#555" }}>{subtitle}</h3>
                <h4 style={{ fontSize: "24px", fontWeight: "bold", color: "black", margin: 0, position: "absolute", top: 0, right: 0 }}>
                    {data.reduce((sum, item) => sum + item.value, 0).toLocaleString("es-CR")} unidades
                </h4>
            </div>
            <div className="chart" style={{ padding: "1rem 1rem" }} >
                {data.map((item, index) => {
                    const percent = (item.value / max) * 100;

                    return (
                        <div
                            key={item.label}
                            className="bar-row"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                width: "100%",
                                textAlign: "left",
                                padding: "0.5rem 0",
                                borderTop: "1px solid rgb(132, 131, 131)0",
                            }}
                        >

                            <span style={{ width: 28, color: "#a3b0aa", fontWeight: 600 }}>
                                {String(index + 1).padStart(2, "0")}
                            </span>



                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span
                                    title={item.label}
                                    style={{
                                        display: "block",
                                        fontWeight: 600,
                                        color: "#1c2b25",
                                        marginBottom: 6,
                                    }}
                                >
                                    {item.label}
                                </span>

                                <div
                                    className="progress"
                                    role="progressbar"
                                    aria-label={item.label}
                                    aria-valuenow={Math.round(percent)}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    style={{ height: 6, width: "78%" }}
                                >
                                    <div className="progress-bar" style={{ backgroundColor: "#1b7a25", width: `${percent}%` }} />
                                </div>
                            </div>



                            <span style={{ minWidth: 65, textAlign: "left", fontWeight: 600, color: "#060606", paddingLeft: "12px" }}>
                                {item.value + " u."}
                            </span>
                        </div>
                    );
                })}

            </div>
        </div >
    );
}

export default BartChar;