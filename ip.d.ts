declare module 'ip' {
    export function address(): string;
    export function subnet(ip: string, mask: string): { network: string; subnet: string; broadcast: string; };
    export function isPrivate(ip: string): boolean;
    export function isLoopback(ip: string): boolean;
}