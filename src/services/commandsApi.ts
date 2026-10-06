import { RPCommand } from '../types';
import { INITIAL_RP_COMMANDS } from '../data/initialCommands';

// Get current official commands uploaded by admin
export function getOfficialCommands(): RPCommand[] {
  // Always returns the admin's authoritative uploaded commands from INITIAL_RP_COMMANDS
  return INITIAL_RP_COMMANDS;
}

// Fetch all commands (purely client-side from admin-defined dataset, no Firebase needed)
export async function fetchAllCommands(): Promise<RPCommand[]> {
  try {
    // Clear old deprecated cache from previous versions if present
    localStorage.removeItem('roblox_rp_commands_cache');
  } catch {
    // ignore
  }
  return INITIAL_RP_COMMANDS;
}

export interface GenerateAiCommandParams {
  userPrompt: string;
  tone?: string;
}

export async function requestGenerateAiCommand(params: GenerateAiCommandParams): Promise<{
  success: boolean;
  commandText?: string;
  source?: string;
  message?: string;
}> {
  try {
    const res = await fetch('/api/commands/generate-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('requestGenerateAiCommand error:', err);
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau giây lát.',
    };
  }
}

