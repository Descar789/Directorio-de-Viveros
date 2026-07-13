import ImportadorCsv from "@/components/admin/ImportadorCsv";

export default function AdminImportar() {
  return (
    <main>
      <h1 className="font-heading text-3xl font-bold">Importar viveros (CSV)</h1>
      <p className="text-muted mt-1">
        Los viveros importados quedan como <strong>pre-cargados</strong>: visibles en el
        directorio y reclamables por sus dueños.
      </p>
      <div className="mt-6">
        <ImportadorCsv />
      </div>
    </main>
  );
}
