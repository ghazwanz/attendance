import UserStatsPage from "./UserStatsPage";

export default function PageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return <UserStatsPage params={params} />;
}