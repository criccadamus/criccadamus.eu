import { IconExternalLink, IconInfoCircle, IconDownload } from "@tabler/icons-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AddonAlert } from "@/data/addons";

const alertIcons = {
  info: IconInfoCircle,
  download: IconDownload
} as const;

export function AddonAlertCard({ alert }: { alert: AddonAlert }) {
  const Icon = alert.icon ? alertIcons[alert.icon] : null;

  return (
    <Alert variant={alert.variant}>
      {Icon && <Icon className="text-muted-foreground" />}
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription>
        <p>{alert.description}</p>
        {alert.link && (
          <a
            href={alert.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline decoration-dotted underline-offset-4 hover:text-foreground/80"
          >
            {alert.link.text}
            <IconExternalLink className="relative -top-0.5 ml-1 inline h-3.5 w-3.5 text-foreground/60" />
          </a>
        )}
      </AlertDescription>
    </Alert>
  );
}
