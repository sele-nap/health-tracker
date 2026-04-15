export type CorrelationInsight = {
  icon: string;
  title: string;
  body: string;
  impact: "positive" | "negative" | "alert" | "info";
};

type LogEntry = {
  loggedAt: Date;
  overallMood: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
};

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length < 5) return null;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0, dxa = 0, dya = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dxa += dx * dx;
    dya += dy * dy;
  }
  const denom = Math.sqrt(dxa * dya);
  return denom === 0 ? null : num / denom;
}

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function sign(n: number): string {
  return n > 0 ? `+${fmt(n)}` : fmt(n);
}

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const LABELS = {
  en: { mood: "mood", energy: "energy", stress: "stress", sleep: "sleep", sleepQuality: "sleep quality" },
  fr: { mood: "humeur", energy: "énergie", stress: "stress", sleep: "sommeil", sleepQuality: "qualité du sommeil" },
};

export function computeCorrelations(logs: LogEntry[], locale: string): CorrelationInsight[] {
  const isFr = locale === "fr";
  const L = isFr ? LABELS.fr : LABELS.en;
  const dayNames = isFr ? DAY_NAMES_FR : DAY_NAMES_EN;
  const insights: CorrelationInsight[] = [];

  if (logs.length < 5) return insights;

  // ─── 1. Sleep deprivation: stress ───────────────────────────────────────────
  {
    const shortSleep = logs.filter((l) => l.sleepHours !== null && l.sleepHours < 6 && l.stressLevel !== null);
    const goodSleep = logs.filter((l) => l.sleepHours !== null && l.sleepHours >= 6 && l.stressLevel !== null);

    if (shortSleep.length >= 3 && goodSleep.length >= 3) {
      const stressShort = mean(shortSleep.map((l) => l.stressLevel!));
      const stressGood = mean(goodSleep.map((l) => l.stressLevel!));
      const delta = stressShort - stressGood;

      if (Math.abs(delta) >= 0.4) {
        const isNeg = delta > 0;
        insights.push({
          icon: "😴",
          title: isFr ? "Sommeil court → plus de stress" : "Short sleep → higher stress",
          body: isFr
            ? `Quand vous dormez moins de 6h, votre stress est en moyenne ${fmt(Math.abs(delta))} pts ${isNeg ? "plus élevé" : "plus bas"} (${fmt(stressShort)}/10 vs ${fmt(stressGood)}/10 les autres nuits).`
            : `When you sleep less than 6h, your stress averages ${fmt(Math.abs(delta))} pts ${isNeg ? "higher" : "lower"} (${fmt(stressShort)}/10 vs ${fmt(stressGood)}/10 on better nights).`,
          impact: isNeg ? "alert" : "positive",
        });
      }
    }
  }

  // ─── 2. Sleep deprivation: mood ─────────────────────────────────────────────
  {
    const shortSleep = logs.filter((l) => l.sleepHours !== null && l.sleepHours < 6 && l.overallMood !== null);
    const goodSleep = logs.filter((l) => l.sleepHours !== null && l.sleepHours >= 6 && l.overallMood !== null);

    if (shortSleep.length >= 3 && goodSleep.length >= 3) {
      const moodShort = mean(shortSleep.map((l) => l.overallMood!));
      const moodGood = mean(goodSleep.map((l) => l.overallMood!));
      const delta = moodGood - moodShort;

      if (delta >= 0.5) {
        insights.push({
          icon: "🌙",
          title: isFr ? "Le sommeil influence votre humeur" : "Sleep shapes your mood",
          body: isFr
            ? `Après une nuit de moins de 6h, votre humeur chute de ${fmt(delta)} pts en moyenne (${fmt(moodShort)}/10 vs ${fmt(moodGood)}/10 bien reposé·e).`
            : `After a night under 6h, your mood is ${fmt(delta)} pts lower on average (${fmt(moodShort)}/10 vs ${fmt(moodGood)}/10 well-rested).`,
          impact: "alert",
        });
      }
    }
  }

  // ─── 3. Sleep deprivation: energy ───────────────────────────────────────────
  {
    const shortSleep = logs.filter((l) => l.sleepHours !== null && l.sleepHours < 6 && l.energyLevel !== null);
    const goodSleep = logs.filter((l) => l.sleepHours !== null && l.sleepHours >= 6 && l.energyLevel !== null);

    if (shortSleep.length >= 3 && goodSleep.length >= 3) {
      const energyShort = mean(shortSleep.map((l) => l.energyLevel!));
      const energyGood = mean(goodSleep.map((l) => l.energyLevel!));
      const delta = energyGood - energyShort;

      if (delta >= 0.5) {
        insights.push({
          icon: "⚡",
          title: isFr ? "Sommeil court → moins d'énergie" : "Short sleep → lower energy",
          body: isFr
            ? `Vos nuits de moins de 6h vous coûtent ${fmt(delta)} pts d'énergie (${fmt(energyShort)}/10 vs ${fmt(energyGood)}/10).`
            : `Nights under 6h cost you ${fmt(delta)} energy pts the next day (${fmt(energyShort)}/10 vs ${fmt(energyGood)}/10).`,
          impact: "alert",
        });
      }
    }
  }

  // ─── 4. Stress → mood impact ────────────────────────────────────────────────
  {
    const highStress = logs.filter((l) => l.stressLevel !== null && l.stressLevel >= 7 && l.overallMood !== null);
    const lowStress = logs.filter((l) => l.stressLevel !== null && l.stressLevel < 7 && l.overallMood !== null);

    if (highStress.length >= 3 && lowStress.length >= 3) {
      const moodHigh = mean(highStress.map((l) => l.overallMood!));
      const moodLow = mean(lowStress.map((l) => l.overallMood!));
      const delta = moodLow - moodHigh;

      if (delta >= 0.5) {
        insights.push({
          icon: "🧠",
          title: isFr ? "Stress élevé → humeur plus basse" : "High stress → lower mood",
          body: isFr
            ? `Les jours de stress ≥ 7, votre humeur est ${fmt(delta)} pts plus basse (${fmt(moodHigh)}/10 vs ${fmt(moodLow)}/10 les jours calmes).`
            : `On high-stress days (≥7), your mood is ${fmt(delta)} pts lower (${fmt(moodHigh)}/10 vs ${fmt(moodLow)}/10 on calmer days).`,
          impact: "negative",
        });
      }
    }
  }

  // ─── 5. Sleep quality → energy (Pearson) ────────────────────────────────────
  {
    const pairs = logs.filter((l) => l.sleepQuality !== null && l.energyLevel !== null);
    if (pairs.length >= 7) {
      const r = pearson(
        pairs.map((l) => l.sleepQuality!),
        pairs.map((l) => l.energyLevel!)
      );
      if (r !== null && Math.abs(r) >= 0.35) {
        const strength = Math.abs(r) >= 0.6 ? (isFr ? "forte" : "strong") : (isFr ? "modérée" : "moderate");
        const dir = r > 0 ? (isFr ? "positivement" : "positively") : (isFr ? "négativement" : "negatively");
        insights.push({
          icon: "💤",
          title: isFr ? "Qualité du sommeil & énergie" : "Sleep quality & energy",
          body: isFr
            ? `Votre qualité de sommeil et votre énergie sont ${dir} corrélées (r = ${fmt(r, 2)}, corrélation ${strength}).`
            : `Your sleep quality and energy level are ${dir} correlated (r = ${fmt(r, 2)}, ${strength} correlation).`,
          impact: r > 0 ? "info" : "negative",
        });
      }
    }
  }

  // ─── 6. Mood × Energy correlation ───────────────────────────────────────────
  {
    const pairs = logs.filter((l) => l.overallMood !== null && l.energyLevel !== null);
    if (pairs.length >= 7) {
      const r = pearson(
        pairs.map((l) => l.overallMood!),
        pairs.map((l) => l.energyLevel!)
      );
      if (r !== null && r >= 0.5) {
        insights.push({
          icon: "🔗",
          title: isFr ? "Humeur & énergie liées" : "Mood & energy linked",
          body: isFr
            ? `Vos jours de bonne humeur coïncident souvent avec un niveau d'énergie élevé (r = ${fmt(r, 2)}).`
            : `Your high-mood days often coincide with higher energy (r = ${fmt(r, 2)}).`,
          impact: "positive",
        });
      }
    }
  }

  // ─── 7. Best day of week ────────────────────────────────────────────────────
  {
    const byDay: Record<number, number[]> = {};
    for (const log of logs) {
      if (log.overallMood === null) continue;
      const d = log.loggedAt.getDay();
      byDay[d] ??= [];
      byDay[d].push(log.overallMood);
    }

    const dayAvgs = Object.entries(byDay)
      .filter(([, ms]) => ms.length >= 2)
      .map(([d, ms]) => ({ day: Number(d), avg: mean(ms), n: ms.length }));

    if (dayAvgs.length >= 4) {
      dayAvgs.sort((a, b) => b.avg - a.avg);
      const best = dayAvgs[0];
      const worst = dayAvgs[dayAvgs.length - 1];
      const spread = best.avg - worst.avg;

      if (spread >= 1) {
        insights.push({
          icon: "📅",
          title: isFr ? "Votre meilleur jour de la semaine" : "Your best day of the week",
          body: isFr
            ? `Vous vous sentez généralement mieux le ${dayNames[best.day]} (humeur moy. ${fmt(best.avg)}/10) et moins bien le ${dayNames[worst.day]} (${fmt(worst.avg)}/10).`
            : `You tend to feel best on ${dayNames[best.day]}s (avg mood ${fmt(best.avg)}/10) and lowest on ${dayNames[worst.day]}s (${fmt(worst.avg)}/10).`,
          impact: "info",
        });
      }
    }
  }

  // ─── 8. Recent trend (mood) ─────────────────────────────────────────────────
  {
    const moodLogs = logs
      .filter((l) => l.overallMood !== null)
      .sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());

    if (moodLogs.length >= 8) {
      const half = Math.floor(moodLogs.length / 2);
      const first = mean(moodLogs.slice(0, half).map((l) => l.overallMood!));
      const second = mean(moodLogs.slice(half).map((l) => l.overallMood!));
      const delta = second - first;

      if (Math.abs(delta) >= 0.5) {
        const improving = delta > 0;
        insights.push({
          icon: improving ? "📈" : "📉",
          title: isFr
            ? (improving ? "Votre humeur s'améliore" : "Légère baisse de l'humeur")
            : (improving ? "Your mood is improving" : "Mood trending down"),
          body: isFr
            ? `Sur les 30 derniers jours, votre humeur ${improving ? "a progressé" : "a baissé"} de ${fmt(Math.abs(delta))} pt${Math.abs(delta) >= 2 ? "s" : ""} entre la première et la deuxième quinzaine.`
            : `Over the last 30 days, your mood ${improving ? "improved" : "declined"} by ${fmt(Math.abs(delta))} pt${Math.abs(delta) >= 2 ? "s" : ""} from the first to second half.`,
          impact: improving ? "positive" : "negative",
        });
      }
    }
  }

  // ─── 9. Sleep hours trend ───────────────────────────────────────────────────
  {
    const sleepLogs = logs
      .filter((l) => l.sleepHours !== null)
      .sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());

    if (sleepLogs.length >= 8) {
      const half = Math.floor(sleepLogs.length / 2);
      const firstAvg = mean(sleepLogs.slice(0, half).map((l) => l.sleepHours!));
      const secondAvg = mean(sleepLogs.slice(half).map((l) => l.sleepHours!));
      const delta = secondAvg - firstAvg;

      if (Math.abs(delta) >= 0.4) {
        const gaining = delta > 0;
        insights.push({
          icon: gaining ? "🌙" : "⚠️",
          title: isFr
            ? (gaining ? "Vous dormez davantage" : "Vous dormez moins")
            : (gaining ? "You're sleeping more" : "You're sleeping less"),
          body: isFr
            ? `Votre durée de sommeil ${gaining ? "a augmenté" : "a diminué"} de ${fmt(Math.abs(delta))}h en moyenne sur les 15 derniers jours.`
            : `Your sleep duration ${gaining ? "increased" : "decreased"} by ${fmt(Math.abs(delta))}h on average over the last 2 weeks.`,
          impact: gaining ? "positive" : "alert",
        });
      }
    }
  }

  return insights;
}
