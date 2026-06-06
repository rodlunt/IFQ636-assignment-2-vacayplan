import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@headlessui/react';

const TAB_BASE =
  'px-4 py-2 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm transition';

const Tabs = ({
  items = [],
  defaultIndex,
  onChange,
  className = '',
  panelClassName = '',
  ...rest
}) => {
  if (items.length === 0) return null;
  return (
    <TabGroup
      defaultIndex={defaultIndex}
      onChange={onChange}
      className={className}
      {...rest}
    >
      <TabList className="flex border-b border-surface-border">
        {items.map((item, idx) => (
          <Tab
            key={`${item.label}-${idx}`}
            className={({ selected }) =>
              [
                TAB_BASE,
                selected
                  ? 'text-brand border-brand'
                  : 'text-ink-muted border-transparent hover:text-ink',
              ].join(' ')
            }
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {items.map((item, idx) => (
          <TabPanel
            key={`panel-${item.label}-${idx}`}
            className={`pt-4 ${panelClassName}`.trim()}
          >
            {item.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};

export default Tabs;
