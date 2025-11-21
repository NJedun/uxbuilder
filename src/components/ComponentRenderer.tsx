import { ComponentDefinition } from '../types/builder';
import Button from './atoms/Button';
import Title from './atoms/Title';
import Logo from './atoms/Logo';
import Image from './atoms/Image';
import Card from './atoms/Card';
import Paragraph from './atoms/Paragraph';
import Link from './atoms/Link';
import List from './atoms/List';
import Input from './atoms/Input';
import Textarea from './atoms/Textarea';
import Dropdown from './atoms/Dropdown';
import Form from './atoms/Form';
import SocialLinks from './atoms/SocialLinks';

interface ComponentRendererProps {
  component: ComponentDefinition;
}

export default function ComponentRenderer({ component }: ComponentRendererProps) {
  switch (component.type) {
    case 'Container':
      return null; // Containers are rendered directly in Canvas as background layer
    case 'Card':
      return null; // Cards are rendered directly in Canvas as background layer
    case 'Form':
      return null; // Forms are rendered directly in Canvas as background layer
    case 'Button':
      return <Button {...component.props} />;
    case 'Title':
      return <Title {...component.props} />;
    case 'Logo':
      return <Logo {...component.props} />;
    case 'Image':
      return <Image {...component.props} />;
    case 'Paragraph':
      return <Paragraph {...component.props} />;
    case 'Link':
      return <Link {...component.props} />;
    case 'List':
      return <List {...component.props} />;
    case 'Input':
      return <Input {...component.props} />;
    case 'Textarea':
      return <Textarea {...component.props} />;
    case 'Dropdown':
      return <Dropdown {...component.props} />;
    case 'SocialLinks':
      return <SocialLinks {...component.props} />;
    default:
      return <div>Unknown component</div>;
  }
}
