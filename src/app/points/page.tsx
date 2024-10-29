import { Metadata } from 'next';
import PointPage from '@components/Points/PointPage';

export const metadata: Metadata = {
  title: 'Points',
};

export default function PointsPage() {
  return (
    <div className="w-full">
      <PointPage />
    </div>
  )
}