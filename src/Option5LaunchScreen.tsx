import LaunchScreen, { LAUNCH_DURATION_MS } from './LaunchScreen';
import './option5-launch.css';

export const OPTION5_LAUNCH_DURATION_MS = LAUNCH_DURATION_MS;

export default function Option5LaunchScreen({ onDone }: { onDone: () => void }) {
  return <LaunchScreen onDone={onDone} variant="option5" />;
}
