import 'reflect-metadata';
import { DiaryCard } from '../../../shared/components/odos-ui/diary-card';

export default function DiaryList(): React.ReactElement {
  return (
    <div>
      <DiaryCard
        imageUrl="https://placehold.co/600x400"
        percent={60}
        likes={10}
        title="고라니 밥준 일지고라니 밥준 일지고라니 밥준 일지"
        user="고라니"
        userImage=""
        challengeLabel="1D1S 공식 챌린지"
        challengeUrl="/challenges/1d1s"
        date="2025.03.05"
        emotion={'happy'}
      />
    </div>
  );
}
