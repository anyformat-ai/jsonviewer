import { ExampleDoc } from "./ExampleDoc";

export function SampleUrls() {
  return (
    <div className="flex justify-center flex-wrap gap-3">
      <ExampleDoc
        id="d9udW60cLOok"
        title="Twitter API"
        path="data.0.entities.urls.0.expanded_url"
      />
      <ExampleDoc id="PjHo1o5MVeH4" title="GitHub API" />
      <ExampleDoc
        id="XKqIsPgCssUN"
        title="Airtable API"
        path="records.3.createdTime"
      />
      <ExampleDoc
        id="bSc7r1Ta0fED"
        title="Unsplash API"
        path="4.urls.regular"
      />
    </div>
  );
}
