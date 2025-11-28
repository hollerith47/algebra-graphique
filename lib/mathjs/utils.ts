import {PreprocessTarget} from "@/types/domain";
import {convertPower, insertImplicitMultiplication, normalizeInput} from "@/lib/mathjs/normalize";


export function preprocess(expr: string, target: PreprocessTarget = 'js'): string {
    const s0 = normalizeInput(expr);
    const s1 = insertImplicitMultiplication(s0);
       // js: ^ → ** ; mathjs: on garde ^
    return convertPower(s1, target);
}
