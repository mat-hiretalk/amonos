import PitStation from "@/components/pit-station";
import {
  getCasinoData,
  getSelectedCasinoId,
} from "@/app/actions/switch-casinos";

const PitPage = async ({ params }: { params: { casinoId: string } }) => {
  const { casinoId } = await params;
  if (!casinoId) {
    return <div>No casino selected</div>;
  }
  const selectedCasino = await getCasinoData(casinoId);
  if (!selectedCasino) {
    return <div>No casino data found</div>;
  }
  return (
    <div>
      <PitStation casino={selectedCasino} />
    </div>
  );
};

export default PitPage;
