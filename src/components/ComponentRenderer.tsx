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
import NavMenu from './atoms/NavMenu';
import SearchBar from './atoms/SearchBar';
import HeaderActions from './atoms/HeaderActions';
import HamburgerIcon from './atoms/HamburgerIcon';
import HeaderPattern from './atoms/HeaderPattern';
import HorizontalLine from './atoms/HorizontalLine';
import FooterPattern from './atoms/FooterPattern';
import CopyrightText from './atoms/CopyrightText';
import ProductCard from './atoms/ProductCard';
import ProductList from './atoms/ProductList';
import ProductDetails from './atoms/ProductDetails';
import HeroSection from './atoms/HeroSection';
import HeroWithImage from './atoms/HeroWithImage';
import ContactForm from './atoms/ContactForm';

interface ComponentRendererProps {
  component: ComponentDefinition;
  useThemeStyles?: boolean;
}

export default function ComponentRenderer({ component, useThemeStyles = false }: ComponentRendererProps) {
  switch (component.type) {
    // Header Components
    case 'NavMenu':
      return <NavMenu {...component.props} useThemeStyles={useThemeStyles} />;
    case 'SearchBar':
      return <SearchBar {...component.props} useThemeStyles={useThemeStyles} />;
    case 'HeaderActions':
      return <HeaderActions {...component.props} useThemeStyles={useThemeStyles} />;
    case 'HamburgerIcon':
      return <HamburgerIcon useThemeStyles={useThemeStyles} />;
    case 'HeaderPattern':
      return <HeaderPattern {...component.props} useThemeStyles={useThemeStyles} />;
    case 'HorizontalLine':
      return <HorizontalLine {...component.props} useThemeStyles={useThemeStyles} />;

    // Footer Components
    case 'FooterPattern':
      return <FooterPattern {...component.props} useThemeStyles={useThemeStyles} />;
    case 'CopyrightText':
      return <CopyrightText {...component.props} useThemeStyles={useThemeStyles} />;

    // Content Patterns
    case 'ProductCard':
      return <ProductCard {...component.props} useThemeStyles={useThemeStyles} />;
    case 'ProductList':
      return <ProductList {...component.props} useThemeStyles={useThemeStyles} />;
    case 'ProductDetails':
      return <ProductDetails {...component.props} useThemeStyles={useThemeStyles} />;
    case 'HeroSection':
      return <HeroSection {...component.props} useThemeStyles={useThemeStyles} />;
    case 'HeroWithImage':
      return <HeroWithImage {...component.props} useThemeStyles={useThemeStyles} />;
    case 'ContactForm':
      return <ContactForm {...component.props} useThemeStyles={useThemeStyles} />;

    // Basic Components
    case 'Card':
      return <Card {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Form':
      return <Form {...component.props} />;
    case 'Button':
      return <Button {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Title':
      return <Title {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Logo':
      return <Logo {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Image':
      return <Image {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Paragraph':
      return <Paragraph {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Link':
      return <Link {...component.props} useThemeStyles={useThemeStyles} />;
    case 'List':
      return <List {...component.props} />;
    case 'Input':
      return <Input {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Textarea':
      return <Textarea {...component.props} useThemeStyles={useThemeStyles} />;
    case 'Dropdown':
      return <Dropdown {...component.props} />;
    case 'SocialLinks':
      return <SocialLinks {...component.props} useThemeStyles={useThemeStyles} />;
    default:
      return <div>Unknown component</div>;
  }
}
