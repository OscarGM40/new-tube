import { FormSection } from "../sections/form-section";

interface PageProps {
  videoId: string;
}
export const VideoView = ({ videoId }: PageProps) => {
  return (
    <div className="px-4 pt-2.5 w-full">
      <FormSection videoId={videoId} />
    </div>
  );
};
