import { useQuery } from "@tanstack/react-query";

type RepoData = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
};

async function fetchRepo(): Promise<RepoData> {
  const res = await fetch("https://api.github.com/repos/KofLang/Kof4j");
  if (!res.ok) throw new Error("GitHub indisponível");
  return res.json();
}

export function GithubStats() {
  const { data, isError } = useQuery({
    queryKey: ["kof-repo"],
    queryFn: fetchRepo,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const items = [
    { label: "Stars", value: data ? String(data.stargazers_count) : "—" },
    { label: "Forks", value: data ? String(data.forks_count) : "—" },
    { label: "Open issues", value: data ? String(data.open_issues_count) : "—" },
    {
      label: "Último push",
      value: data
        ? new Date(data.pushed_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="bg-surface px-4 py-5">
            <dt className="mono-label">{item.label}</dt>
            <dd className="mt-2 font-mono text-2xl tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {isError
          ? "Dados do GitHub indisponíveis no momento — nenhum número é inventado aqui."
          : "Dados lidos ao vivo da API pública do GitHub (KofLang/Kof4j)."}
      </p>
    </div>
  );
}
