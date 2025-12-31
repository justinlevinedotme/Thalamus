/**
 * @file MeFilesRoute.tsx
 * @description Files page within the /me hub. Displays the user's saved graphs
 * using the shared DocsDashboard component.
 */

import DocsDashboard from "../features/docs/DocsDashboard";

export default function MeFilesRoute() {
  return <DocsDashboard />;
}
