/**
 * Utilitários para lidar com datas sem deslocamento de timezone (problema do dia anterior).
 */

/**
 * Retorna a data atual ou uma data específica no formato YYYY-MM-DD local.
 * Evita o problema do toISOString() que pode pular para o dia seguinte dependendo do horário.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Cria um objeto Date a partir de uma string YYYY-MM-DD garantindo que seja o meio-dia local.
 * Isso evita que o timezone desloque a data para o dia anterior ao formatar.
 */
export function parseISOToLocal(dateString: string): Date {
  if (!dateString) return new Date();
  // Pega apenas a parte da data se for um ISO completo
  const cleanDate = dateString.split('T')[0];
  const [year, month, day] = cleanDate.split("-").map(Number);
  // Criar no meio-dia local para segurança absoluta contra offsets
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formata uma string de data do banco para o padrão brasileiro Amigável (Ex: 01 de abr)
 */
export function formatFriendlyDate(dateString: string): string {
  const date = parseISOToLocal(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  }).replace('.', '');
}

/**
 * Formata para DD/MM/YYYY
 */
export function formatFullDate(dateString: string): string {
  const date = parseISOToLocal(dateString);
  return date.toLocaleDateString("pt-BR");
}
