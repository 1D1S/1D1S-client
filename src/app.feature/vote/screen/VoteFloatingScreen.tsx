import VoteFloatingWidget from '../components/VoteFloatingWidget';

interface VoteFloatingScreenProps {
  enabled: boolean;
  hasBottomNav: boolean;
}

export default function VoteFloatingScreen({
  enabled,
  hasBottomNav,
}: VoteFloatingScreenProps): React.ReactElement {
  return (
    <VoteFloatingWidget enabled={enabled} hasBottomNav={hasBottomNav} />
  );
}
