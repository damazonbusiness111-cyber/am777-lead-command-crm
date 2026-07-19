import IntegrationCard from './IntegrationCard';

export default function IntegrationGrid({ integrations, onOpen }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {integrations.map((i) => (
        <IntegrationCard key={i.key} integration={i} onOpen={onOpen} />
      ))}
    </div>
  );
}
