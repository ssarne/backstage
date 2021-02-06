/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import parseGitUrl from 'git-url-parse';
import path from 'path';
import { Logger } from 'winston';
import { checkoutGitRepository, parseReferenceAnnotation } from '../../helpers';
import { PreparerBase, PreparerResponse } from './types';

export class CommonGitPreparer implements PreparerBase {
  private readonly config: Config;
  private readonly logger: Logger;

  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  async prepare(entity: Entity): Promise<PreparerResponse> {
    const { target } = parseReferenceAnnotation(
      'backstage.io/techdocs-ref',
      entity,
    );

    try {
      const repoPath = await checkoutGitRepository(
        target,
        this.config,
        this.logger,
      );
      const parsedGitLocation = parseGitUrl(target);

      // TODO: Return git commit sha
      const etag = '';

      return {
        preparedDir: path.join(repoPath, parsedGitLocation.filepath),
        etag,
      };
    } catch (error) {
      this.logger.debug(`Repo checkout failed with error ${error.message}`);
      throw error;
    }
  }
}
