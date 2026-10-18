export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-81D1QPKQXK";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Log page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Log specific custom events
export const event = (
  action: string,
  params: Record<string, string | number | boolean | undefined | null> = {},
) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
};

// Professional tracking helpers
export const trackOutboundLink = (url: string, label?: string) => {
  event("click_outbound", {
    event_category: "outbound_link",
    event_label: label || url,
    outbound_url: url,
  });
};

export const trackJourneyStep = (step: string, status?: string) => {
  event("journey_step_view", {
    event_category: "journey",
    step_name: step,
    status: status || "active",
  });
};

export const trackFilterApplied = (filters: Record<string, string>) => {
  event("filter_dashboard", {
    event_category: "engagement",
    ...filters,
  });
};

export const trackStoryExpand = (storyTitle: string, university: string) => {
  event("story_expand", {
    event_category: "content",
    story_title: storyTitle,
    university,
  });
};
