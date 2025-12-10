declare module 'react-native-peeps' {
    import { ComponentType } from 'react';
    import { StyleProp, ViewStyle } from 'react-native';

    export interface PeepProps {
        style?: StyleProp<ViewStyle>;
        accessory?: ComponentType<any>;
        body?: ComponentType<any>;
        face?: ComponentType<any>;
        facialHair?: ComponentType<any>;
        hair?: ComponentType<any>;
        viewBox?: { x: number; y: number; width: number; height: number };
    }

    const Peep: ComponentType<PeepProps>;
    export default Peep;

    export const Accessories: Record<string, ComponentType<any>>;
    export const Body: Record<string, ComponentType<any>>;
    export const Face: Record<string, ComponentType<any>>;
    export const FacialHair: Record<string, ComponentType<any>>;
    export const Hair: Record<string, ComponentType<any>>;
}
