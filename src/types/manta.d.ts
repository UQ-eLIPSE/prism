declare module 'manta' {
  import * as stream from 'stream';

  namespace auth {
    export function cliSigner(options: any): any;
    export function privateKeySigner(options: any): any;
    export function sshAgentSigner(options: any): any;
    export function loadSSHKey(fp: any, cb: any): void;
  }

  namespace cc {
    interface DefaultOptionOneName {
      name: string;
      type: string;
      help?: string;
      helpArg?: string;
      env?: string;
      default?: boolean;
      hidden?: boolean;
    }

    interface DefaultOptionManyNames {
      names: string[];
      type: string;
      help?: string;
      helpArg?: string;
      env?: string;
      default?: boolean;
      hidden?: boolean;
    }

    interface DefaultOptionGroup {
      group: string;
    }

    type DefaultOptions = (
      | DefaultOptionOneName
      | DefaultOptionManyNames
      | DefaultOptionGroup
    )[];

    interface CreateClientOptionsRetry {
      minTimeout: number;
      maxTimeout: number;
      retries: number;
    }

    interface CreateClientOptions extends manta.ClientOptions {
      agent: any;
      rejectUnauthorized: any;
      retry: CreateClientOptionsRetry;
    }

    const DEFAULTanyOPTIONS: DefaultOptions;

    function createClient(
      options: Partial<CreateClientOptions>,
    ): manta.MantaClient;
    function createClientFromFileSync(
      filename: string,
      log: any,
    ): manta.MantaClient;
    function checkBinEnv(opts: any): void;
    function cloneOptions(
      options: Partial<CreateClientOptions>,
    ): Partial<CreateClientOptions>;
    function createBinClient(opts: any): any;
    function usage(parser: any, errmsg: any, extra: any): void;
    function setupLogger(opts: any, log: any): any;
    function versionCheckPrintAndExit(opts: any): void;
    function completionCheckPrintAndExit(
      opts: any,
      parser: any,
      name: string,
      argtypes?: string[],
    ): void;
  }

  namespace manta {
    interface ClientOptions {
      connectTimeout: number;
      headers?: { [key: string]: string };
      socketPath: string;
      url: string;
      user: string;
      subuser: string | null;
      role: string[];
      sign: any;
    }

    type JobConfiguration = string | string[] | Object;

    class MantaClient {
      constructor(options: ClientOptions);

      close(): void;
      signRequest(opts: any, cb: any): void;
      toString(): string;
      chattr(p: string, cb: any): void;
      chattr(p: string, opts: any, cb: any): void;
      get(p: string, cb: any): void;
      get(p: string, opts: any, cb: any): void;
      createReadStream(p: string, opts?: any): stream.PassThrough;
      ftw(p: string, cb: any): void;
      ftw(p: string, opts: any, cb: any): void;
      info(p: string, cb: any): void;
      info(p: string, opts: any, cb: any): void;
      ln(src: string, p: string, cb: any): void;
      ln(src: string, p: string, opts: any, cb: any): void;
      createListStream(dir: string, opts?: any): any;
      ls(dir: string, cb: any): void;
      ls(dir: string, opts: any, cb: any): void;
      mkdir(dir: string, cb: any): void;
      mkdir(dir: string, opts: any, cb: any): void;

      mkdirp(dir: string, cb: any): void;
      mkdirp(dir: string, opts: any, cb: any): void;
      put(p: string, input: stream.Readable, cb: any): void;
      put(p: string, input: stream.Readable, opts: any, cb: any): void;

      createWriteStream(p: string, opts?: any): stream.Writable;
      rmr(p: string, cb: any): void;
      rmr(p: string, opts: any, cb: any): void;
      unlink(p: string, cb: any): void;
      unlink(p: string, opts: any, cb: any): void;
      createJob(j: JobConfiguration, cb: any): void;
      createJob(j: JobConfiguration, opts: any, cb: any): void;
      job(j: string, cb: any): void;
      job(j: string, opts: any, cb: any): void;
      listJobs(cb: any): void;
      listJobs(opts: any, cb: any): void;
      jobs(cb: any): void;
      jobs(opts: any, cb: any): void;
      addJobKey(j: string, k: string | string[], cb: any): void;
      addJobKey(j: string, k: string | string[], opts: any, cb: any): void;
      cancelJob(j: string, cb: any): void;
      cancelJob(j: string, opts: any, cb: any): void;
      endJob(j: string, cb: any): void;
      endJob(j: string, opts: any, cb: any): void;
      jobInput(j: string, cb: any): void;
      jobInput(j: string, opts: any, cb: any): void;
      jobOutput(j: string, cb: any): void;
      jobOutput(j: string, opts: any, cb: any): void;

      jobFailures(j: string, cb: any): void;
      jobFailures(j: string, opts: any, cb: any): void;

      jobErrors(j: string, cb: any): void;
      jobErrors(j: string, opts: any, cb: any): void;

      jobShare(j: string, cb: any): void;
      jobShare(j: string, opts: any, cb: any): void;

      signURL(opts: any, cb: any): void;

      /** @deprecated */

      signUrl(opts: any, cb: any): void;
      medusaAttach(j: string, cb: any): void;
      medusaAttach(j: string, opts: any, cb: any): void;
      path(p: string, skipEncode: boolean): string;
      createUpload(p: string, opts: any, cb: any): void;
      uploadPart(stream: stream.Readable, id: string, opts: any, cb: any): void;
      abortUpload(id: string, cb: any): void;
      abortUpload(id: string, opts: any, cb: any): void;
      getUpload(id: string, cb: any): void;
      getUpload(id: string, opts: any, cb: any): void;
      commitUpload(id: string, p: string, cb: any): void;
      commitUpload(id: string, p: string, opts: any, cb: any): void;
    }

    function getPath(p: string, skipEncode: boolean): string;
    function getPath(p: string, user: string, skipEncode: boolean): string;
    function getJobPath(p: string, user: string): string;

    const path: typeof getPath;
    const jobPath: typeof getJobPath;
  }

  namespace options {
    interface ParseOptionsOptions {
      name: string;
      parser: any;
      argTypes: string[];
      parseCmdOptions: any;
      log: any;
    }

    function parseOptions(args: ParseOptionsOptions): any;
  }

  namespace progbar {}

  namespace Queue {}

  namespace StringStream {}

  namespace utils {
    function escapePath(s: string): string;
  }

  export const Queue: any;
  export const StringStream: any;
  export const ProgressBar: any;
  export const MantaClient: typeof manta.MantaClient;
  export const createClient: typeof cc.createClient;
  export const createClientFromFileSync: typeof cc.createClientFromFileSync;
  export const checkBinEnv: typeof cc.checkBinEnv;
  export const cloneOptions: typeof cc.cloneOptions;
  export const createBinClient: typeof cc.createBinClient;
  export const DEFAULTanyCLIanyOPTIONS: typeof cc.DEFAULTanyOPTIONS;
  export const clianyusage: typeof cc.usage;
  export const clianylogger: typeof cc.setupLogger;
  export const cliVersionCheckPrintAndExit: typeof cc.versionCheckPrintAndExit;
  export const cliCompletionCheckPrintAndExit: typeof cc.completionCheckPrintAndExit;
  export const cliSigner: typeof auth.cliSigner;
  export const privateKeySigner: typeof auth.privateKeySigner;
  export const sshAgentSigner: typeof auth.sshAgentSigner;
  export const signUrl: (opts: any, cb: any) => any;
  export const loadSSHKey: typeof auth.loadSSHKey;
  export const assertPath: (p: any, noThrow: any) => any;
  export const path: typeof manta.path;
  export const jobPath: typeof manta.jobPath;
  export const escapePath: typeof utils.escapePath;
  export const parseOptions: typeof options.parseOptions;
}
