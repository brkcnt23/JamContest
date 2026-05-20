"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SEED_EMAILS = [
    'superadmin@jamcontest.com',
    'admin@jamcontest.com',
    'organizer1@jamcontest.com',
    'organizer2@jamcontest.com',
    'jury1@jamcontest.com',
    'jury2@jamcontest.com',
    'jury3@jamcontest.com',
    'p1@jamcontest.com',
    'p2@jamcontest.com',
    'p3@jamcontest.com',
    'p4@jamcontest.com',
    'p5@jamcontest.com',
    'p6@jamcontest.com',
    'p7@jamcontest.com',
    'p8@jamcontest.com',
    'test@jamcontest.com',
];
async function main() {
    const hash = await bcrypt.hash('asd123', 10);
    for (const email of SEED_EMAILS) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`SKIP (not found): ${email}`);
            continue;
        }
        await prisma.user.update({
            where: { email },
            data: { passwordHash: hash, emailVerified: true },
        });
        console.log(`OK: ${email} (${user.username})`);
    }
    console.log('\nDone — all passwords reset to asd123');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=reset-passwords.js.map