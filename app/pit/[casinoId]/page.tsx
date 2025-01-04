import PitStation from "@/components/pit-station";
import {
  getCasinoData,
  getSelectedCasinoId,
} from "@/app/actions/switch-casinos";

type Params = {
  params: Promise<{
    casinoId: string;
  }>;
};

const PitPage = async ({ params }: Params) => {
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
