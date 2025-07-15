import QrScanPage from "./qrscan";

type Props = {
  onScanSuccess: (data: string) => void;
  onScanError?: (err: string) => void;
};

export default function page({ onScanSuccess, onScanError }: Props) {
 

  return < QrScanPage/>;
}
